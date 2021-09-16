import { NextApiResponse } from "next";

import { NextIronRequest, withSession } from "helpers/session";

const handler = (req: NextIronRequest, res: NextApiResponse) => {
  req.session.destroy();
  res.redirect("/");
};

export default withSession(handler);
