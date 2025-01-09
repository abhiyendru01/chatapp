import'react';

const Footer = () => {
  return (
    <div className="flex justify-center items-center relative transition-all duration-[450ms] ease-in-out w-full p-4">
      <div className="border border-solid border-base-300 w-full ease-in-out duration-500 left-0 rounded-2xl flex shadow-lg bg-base-100">
        <label
          className="relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-base-300 group flex flex-row gap-3 items-center justify-center text-base-300 rounded-xl cursor-pointer"
          htmlFor="dashboard"
        >
          <input id="dashboard" name="path" type="radio" className="hidden peer" />
          <svg
            viewBox="0 0 24 24"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="peer-hover:scale-110 peer-hover:text-base-300 peer-checked:text-base-300 text-2xl peer-checked:scale-110 transition-all duration-300"
          >
            <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm-1 7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7zm1-10h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z" />
          </svg>
        </label>
        <label
          className="relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-base-300 group flex flex-row gap-3 items-center justify-center text-base-content rounded-xl cursor-pointer"
          htmlFor="profile"
        >
          <input id="profile" name="path" type="radio" className="hidden peer" />
          <svg
            viewBox="0 0 24 24"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="peer-hover:scale-110 peer-hover:text-primary peer-checked:text-primary text-2xl peer-checked:scale-110 transition-all duration-300"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </label>
        
      </div>
    </div>
  );
};

export default Footer;
