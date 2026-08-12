import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.organisasiId = user.organisasiId;
        token.organisasiNama = user.organisasiNama;
        token.fotoProfil = user.fotoProfil;
      }
      if (trigger === "update" && session?.fotoProfil) {
        token.fotoProfil = session.fotoProfil;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).fotoProfil = token.fotoProfil;
        (session.user as any).organisasiId = token.organisasiId;
        (session.user as any).organisasiNama = token.organisasiNama;
        
        // Also keep them at root for backward compatibility with some files
        (session as any).organisasiId = token.organisasiId;
        (session as any).organisasiNama = token.organisasiNama;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  }
} satisfies NextAuthConfig;
