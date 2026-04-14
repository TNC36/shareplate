import { Link, NavLink } from "react-router-dom";
const links = [
  { to: "/", label: "Home" },
  { to: "/donor", label: "Donor" },
  { to: "/responder", label: "Responder" },
  { to: "/claim-lookup", label: "Claim Lookup" },
];
function TopNav() {
  return (
    <header className="top-rail">
      <nav className="top-rail-inner">
        <Link className="top-logo" to="/">
          SharePlate
        </Link>
        <div className="top-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `top-link ${isActive ? "top-link-active" : "top-link-idle"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <p className="top-foot">Live Rescue</p>
      </nav>
    </header>
  );
}
export default TopNav;
