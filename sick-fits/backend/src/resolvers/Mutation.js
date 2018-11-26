const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if the yare logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: { ...args }
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
  }
};

module.exports = Mutations;
