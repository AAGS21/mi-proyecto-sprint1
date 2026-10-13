// Configuración de Passport (local + Google OAuth).
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as logic from './userLogic.js';

export const setupPassport = () => {
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await logic.loginUser({ email, password });
        done(null, user);
      } catch (e) {
        done(null, false, { message: e.message });
      }
    }
  ));

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const user = await logic.upsertOAuthUser({
          email, name: profile.displayName, provider: 'google',
        });
        done(null, user);
      } catch (e) { done(e); }
    }));
  }
};