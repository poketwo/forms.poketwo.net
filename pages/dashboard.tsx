import MainLayout from "~components/MainLayout";
import { AuthMode, withServerSideSession } from "~helpers/session";
import { User } from "~helpers/types";

type DashboardProps = { user: User };

const Dashboard = ({ user }: DashboardProps) => {
  return <MainLayout user={user} />;
};

export default Dashboard;

export const getServerSideProps = withServerSideSession<DashboardProps>(async ({ req }) => {
  const user = req.session.get<User>("user");
  return { props: { user } };
}, AuthMode.REQUIRE_AUTH);
