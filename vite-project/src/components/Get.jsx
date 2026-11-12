import { Link } from "react-router-dom";

export default function GetStarted() {
  return (
    <section id="get-started" className="scroll-mt-16 bg-[#0F1B2E] px-6 py-20">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 px-6 py-16 text-center shadow-2xl md:px-10 md:py-20">

        {/* Title */}
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          Ready to Get Started?
        </h2>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 md:text-xl">
          Join thousands of companies using our platform to manage
          finishing and construction projects more efficiently.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

          {/* Create Account / Create Email */}
          <Link
            to="/signup"
            className="
              inline-block
              min-w-[210px]
              rounded-xl
              bg-white
              px-8
              py-4
              text-lg
              font-semibold
              text-blue-600
              shadow-lg
              transition
              duration-300
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            Create Account
          </Link>

          {/* Sign In */}
          <Link
            to="/login"
            className="
              inline-block
              min-w-[155px]
              rounded-xl
              border-2
              border-white
              bg-transparent
              px-8
              py-4
              text-lg
              font-semibold
              text-white
              transition
              duration-300
              hover:bg-white
              hover:text-blue-600
            "
          >
            Sign In
          </Link>

        </div>
      </div>
    </section>
  );
}