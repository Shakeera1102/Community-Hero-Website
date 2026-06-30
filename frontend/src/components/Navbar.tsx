import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useI18n, LANGS, Lang } from "../i18n";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const nav = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🛡️ {t("appName")}</Link>
      <div className="links">
        {/* Everyone */}
        <NavLink to="/leaderboard">{t("leaderboard")}</NavLink>

        {/* Citizen */}
        {user?.role === "citizen" && (
          <>
            <NavLink to="/map">{t("map")}</NavLink>
            <NavLink to="/dashboard">{t("dashboard")}</NavLink>
            <NavLink to="/report">+ {t("report")}</NavLink>
          </>
        )}

        {/* Contractor */}
        {user?.role === "contractor" && (
          <>
            <NavLink to="/dashboard">{t("dashboard")}</NavLink>
            <NavLink to="/squads">{t("squads")}</NavLink>
            <NavLink to="/maintenance/my">
              My Maintenance
            </NavLink>
          </>
        )}

        {/* Municipal Officer */}
        {user?.role === "authority" && (
          <>
            <NavLink to="/map">{t("map")}</NavLink>
            <NavLink to="/wards">{t("wards")}</NavLink>
            <NavLink to="/predictions">{t("predictions")}</NavLink>
            <NavLink to="/dashboard">{t("dashboard")}</NavLink>
            <NavLink to="/authority">{t("authority")}</NavLink>
            <NavLink to="/budget">{t("budget")}</NavLink>

            <NavLink to="/squads">{t("squads")}</NavLink>

            <NavLink to="/maintenance">
              Maintenance
            </NavLink>

            <NavLink to="/report">
              + {t("report")}
            </NavLink>

            <NavLink to="/maintenance/approval">

              Task Approval

            </NavLink>

          </>
        )}
      </div>
      <div className="right">
        <select className="lang" value={lang} onChange={(e) => setLang(e.target.value as Lang)}
          aria-label={t("language")}>
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        {user ? (
          <>
            <NotificationBell />
            <Link to="/profile" className="user-chip">👤 {user.name}</Link>
            <button className="btn ghost sm" onClick={() => { logout(); nav("/"); }}>{t("logout")}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn ghost sm">{t("login")}</Link>
            <Link to="/signup" className="btn sm">{t("signup")}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
