import { GetServerSideProps } from "next";

// Redirect /my-submissions/[formId] to /a/[formId]/submissions

const MySubmissionsFormRedirect = () => null;
export default MySubmissionsFormRedirect;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const formId = params?.formId?.toString();
  if (!formId) return { notFound: true };

  return {
    redirect: {
      permanent: true,
      destination: `/a/${formId}/submissions`,
    },
  };
};
