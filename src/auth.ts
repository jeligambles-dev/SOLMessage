import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      // Store Twitter data in the JWT token
      if (profile) {
        token.twitterHandle = (profile as { data?: { username?: string } }).data?.username || "";
        token.twitterName = (profile as { data?: { name?: string } }).data?.name || "";
        token.twitterImage = (profile as { data?: { profile_image_url?: string } }).data?.profile_image_url || "";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose Twitter data on the session
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any;
        user.twitterHandle = token.twitterHandle;
        user.twitterName = token.twitterName;
        user.twitterImage = token.twitterImage;
      }
      return session;
    },
  },
});
