import { GetServerSideProps } from "next";

// Redirect /my-submissions/[formId]/[submissionId] to /a/[formId]/submissions/[submissionId]

const MySubmissionsDetailRedirect = () => null;
export default MySubmissionsDetailRedirect;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const formId = params?.formId?.toString();
  const submissionId = params?.submissionId?.toString();
  if (!formId || !submissionId) return { notFound: true };

  return {
    redirect: {
      permanent: true,
      destination: `/a/${formId}/submissions/${submissionId}`,
    },
  };
};
