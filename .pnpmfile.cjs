// pnpm install hooks.
//
// @prisma/client declares `prisma` (CLI) and `typescript` as *optional* peers. Because both are
// devDependencies of @seoflow/api, pnpm links them as peers, and `pnpm deploy --prod` then ships
// the CLI, Prisma Studio, PGlite and TypeScript (~200MB) in the production image. The runtime
// client needs neither, so the optional peer declarations are removed.
function readPackage(pkg) {
  if (pkg.name === '@prisma/client') {
    for (const peer of ['prisma', 'typescript']) {
      delete pkg.peerDependencies?.[peer];
      delete pkg.peerDependenciesMeta?.[peer];
    }
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
