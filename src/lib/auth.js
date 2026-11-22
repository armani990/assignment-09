import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI);
const db = client.db("pizzahub");

const ALLOWED_ROLES = ["customer", "vendor"];

function readCookie(ctx, name) {
  const header =
    ctx?.request?.headers?.get?.("cookie") ||
    ctx?.headers?.get?.("cookie") ||
    "";

  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: ["customer", "vendor"],
        required: false,
        defaultValue: "customer",
        input: true,
      },
    },
  },

  // Server-side password validation
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const password = ctx.body?.password;

      const isValidPassword =
        typeof password === "string" &&
        password.length >= 6 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password);

      if (!isValidPassword) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must be at least 6 characters and include one uppercase and one lowercase letter.",
        });
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const isOAuthCallback = ctx?.path?.startsWith("/callback");

          let role = user.role;

          if (isOAuthCallback) {
            const cookieRole = readCookie(ctx, "signup_role");

            if (ALLOWED_ROLES.includes(cookieRole)) {
              role = cookieRole;
            }
          }

          if (!ALLOWED_ROLES.includes(role)) {
            role = "customer";
          }

          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
    },
  },

  plugins: [jwt()],
});