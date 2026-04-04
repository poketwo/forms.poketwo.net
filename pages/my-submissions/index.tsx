// Redirect /my-submissions to /dashboard
// Submissions are now accessed through each form's tab at /a/[formId]/submissions

const MySubmissionsRedirect = () => null;
export default MySubmissionsRedirect;

export const getServerSideProps = async () => {
  return {
    redirect: {
      permanent: true,
      destination: "/dashboard",
    },
  };
};
