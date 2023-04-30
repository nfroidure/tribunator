import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { publicRuntimeConfig } from "../utils/config";
import {
  CSS_BREAKPOINT_END_M,
  CSS_BREAKPOINT_END_S,
  CSS_BREAKPOINT_START_L,
  CSS_BREAKPOINT_START_M,
  CSS_BREAKPOINT_START_XL,
} from "../utils/constants";
import Heading2 from "./h2";
import Paragraph from "./p";
import Popin from "./popin";
import Button from "./button";

const Menu = () => {
  const router = useRouter();
  const [popinIsVisible, setPopinIsVisible] = useState(false);

  return (
    <div className="root">
      <nav>
        <Link legacyBehavior href="/">
          <a
            className={`home${router.asPath === "/" ? " selected" : ""}`}
            title="Revenir à l’accueil"
          >
            <span>Accueil</span>
          </a>
        </Link>
        <Link legacyBehavior href="/elu-es">
          <a
            className={router.asPath.startsWith("/elu-es") ? "selected" : ""}
            title="Voir les profils des élu·es"
          >
            <span>Élu·es</span>
          </a>
        </Link>
        <Link legacyBehavior href="/groupes">
          <a
            className={router.asPath.startsWith("/groupes") ? "selected" : ""}
            title="Voir les groupes politiques"
          >
            <span>Groupes</span>
          </a>
        </Link>
        <Link legacyBehavior href="/tribunes">
          <a
            className={router.asPath.startsWith("/tribunes") ? "selected" : ""}
            title="Lire toutes les tribunes"
          >
            <span>Tribunes</span>
          </a>
        </Link>
        <a
          className="newsletter"
          onClick={() => setPopinIsVisible(true)}
          href="#"
          title="S’abonner à la lettre d’information"
        >
          <span>S’abonner</span>
        </a>
      </nav>
      <Popin {...{ popinIsVisible, setPopinIsVisible }}>
        <Heading2>Lettre d’information</Heading2>
        <Paragraph>
          Bien que présent sur les réseaux sociaux, je préfère vivre en dehors
          de ces pièges à attention. Vous inscrire à ma lettre d’information est
          le meilleur moyen de rester au courant des modifications que j’apporte
          au site.
        </Paragraph>
        <Paragraph>
          <Button
            type="link"
            href={`mailto:nicolas.froidure@gmail.com?subject=Abonnement&body=${encodeURIComponent(
              "Je souhaite m’abonner à votre lettre d’information."
            )}`}
            label="S’inscrire"
            icon="mail"
          />
        </Paragraph>
      </Popin>
      <style jsx>{`
        .root {
          background-color: var(--primary);
        }
        nav {
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
        nav a,
        nav a:visited {
          display: block;
          color: var(--light);
          font-size: var(--bigFontSize);
          line-height: var(--bigLineHeight);
          text-decoration: none;
          transition: background-color var(--baseAnimationRate),
            color var(--baseAnimationRate);
        }
        nav a:hover {
          color: var(--primary);
          background-color: var(--light);
          text-decoration: underline;
        }
        nav a.selected {
          text-decoration: underline;
        }
        nav a.newsletter {
          background-color: var(--quaternary);
          color: var(--light);
        }
        nav span {
          display: block;
          padding: calc(var(--vRythm) / 2) var(--gutter);
        }
        @media screen and (max-width: ${CSS_BREAKPOINT_END_S}) {
          nav {
            width: 100%;
          }
        }
        @media screen and (min-width: ${CSS_BREAKPOINT_START_M}) and (max-width: ${CSS_BREAKPOINT_END_M}) {
          nav {
            width: calc(calc(var(--block) * 2) + calc(var(--gutter) * 3));
          }
        }
        @media screen and (min-width: ${CSS_BREAKPOINT_START_L}) {
          nav {
            flex-direction: row;
            width: calc(calc(var(--block) * 3) + calc(var(--gutter) * 4));
          }
          .newsletter span {
            width: calc(var(--vRythm));
            background: var(--light);
            mask-repeat: no-repeat;
            mask-position: center center;
            mask-size: calc(var(--vRythm));
            mask-image: url("${publicRuntimeConfig.buildPrefix}/images/icons/mail.svg");
          }
        }
        @media screen and (min-width: ${CSS_BREAKPOINT_START_XL}) {
          nav {
            width: calc(calc(var(--block) * 4) + calc(var(--gutter) * 5));
          }
        }
        @media print {
          .root {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Menu;
