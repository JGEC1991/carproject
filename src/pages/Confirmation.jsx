import { Link } from 'react-router-dom';

const Confirmation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-semibold mb-4">
        Please Confirm Your Email
      </h1>
      <p className="text-gray-600 mb-8">
        A confirmation email has been sent to your address. Please click the
        link in the email to activate your account.
      </p>
      <Link
        to="/"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Back to Login
      </Link>
    </div>
  );
};

export default Confirmation;
