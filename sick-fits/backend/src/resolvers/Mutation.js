const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged into do that!");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    const update = { ...args };
    delete update.id;
    return ctx.db.mutation.updateItem(
      {
        data: update,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parents, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{id title user{id}}`);

    const ownsItem = item.user.id === ctx.request.userId;

    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMCREATE"].includes(permission)
    );

    if (!ownsItem || !hasPermissions) {
      throw new Error("You cannot add in a new item");
    }
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signUp(parent, args, ctx, info) {
    //lowercase
    args.email = args.email.toLowerCase();
    // password
    const password = await bcrypt.hash(args.password, 8);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    // create jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  },
  async signIn(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({
      where: { email }
    });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error("Invalid Password!");
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  signOut(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye" };
  },
  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({
      where: { email: args.email }
    });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }

    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // one hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    const mailRes = transport.sendMail({
      from: "chris@choozle.com",
      to: user.email,
      subject: "Your password reset",
      html: makeANiceEmail(
        `Your password Reset Token is here \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?token=${resetToken}">Click here to reset!</a>`
      )
    });

    return { message: "Thanks" };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const [user] = await ctx.db.query.user({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if (!user) {
      throw new Error("This token is either invalid or expired");
    }

    const password = await bcrypt.hash(args.password, 10);

    const updatedUser = await ctx.db.mutation.updateUser({
      where: {
        email: user.email
      },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    const token = jwt.sign(
      {
        userId: updatedUser.id
      },
      process.env.APP_SECRET
    );
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in!");
    }
    const currentUser = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      "{id, permissions, email, name}"
    );
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: { id: args.userId }
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You are not signed in!");
    }
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    if (existingCartItem) {
      console.log("the item is already in the cart");
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: userId } },
          item: { connect: { id: args.id } }
        }
      },
      info
    );
  },
  async removeFromCart(parents, args, ctx, info) {
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id, user {id }}`
    );
    if (!cartItem) throw new Error("There is no cart for that ID");
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("Cheating!");
    }
    return ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async createOrder(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be signed in to complete this order");
    }
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id name email cart {
          id quantity item {
            title price id description image }
          }
        }`
    );
  const amount= user.cart.reduce((tally, cartItem)=> tally + cartItem.price * cartItem.quantity, 0);
        console.log(`going to charge for a total of ${amount}`);
};

module.exports = Mutations;
