import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organisasiId: string;
      organisasiNama?: string;
    } & DefaultSession["user"];
    organisasiId?: string;
    organisasiNama?: string;
  }

  interface User extends DefaultUser {
    id: string;
    organisasiId: string;
    organisasiNama?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organisasiId: string;
    organisasiNama?: string;
  }
}
