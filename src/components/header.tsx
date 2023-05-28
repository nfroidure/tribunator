import Link from "next/link";
import { publicRuntimeConfig } from "../utils/config";
import {
  CSS_BREAKPOINT_END_L,
  CSS_BREAKPOINT_END_M,
  CSS_BREAKPOINT_END_S,
  CSS_BREAKPOINT_START_L,
  CSS_BREAKPOINT_START_M,
  CSS_BREAKPOINT_START_XL,
} from "../utils/constants";

const Header = () => {
  return (
    <>
      <header>
        <Link legacyBehavior href="/">
          <a>
            <span className="slogan">Keskidiz ?</span>
            <span className="description">
              Les tribunes des élu·es passées à la moulinette !
            </span>
          </a>
        </Link>
      </header>
      <style jsx>{`
        header {
          background-color: var(--secondary-darker);
        }
        a {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-end;
          margin: 0 auto;
          padding: var(--vRythm) var(--gutter);
          height: calc(var(--vRythm) * 12);
          color: var(--light);
          text-decoration: none;
          font-size: var(--normalFontSize);
          line-height: var(--normalLineHeight);
          background-image: url("${publicRuntimeConfig.buildPrefix}/images/moulinette.svg");
          background-position: var(--gutter) bottom;
          background-color: var(--secondary);
          background-size: contain;
          background-repeat: no-repeat;
          box-shadow: 1px 1px 5px var(--grey);
        }
        span.slogan {
          font-weight: bold;
          font-family: var(--writingFont);
          font-size: var(--giantFontSize);
          line-height: var(--giantLineHeight);
        }
        span.description {
          font-family: var(--contentFont);
          font-size: var(--bigFontSize);
          line-height: var(--bigLineHeight);
        }

        @media screen and (max-width: ${CSS_BREAKPOINT_END_S}) {
          a {
            width: 100%;
            height: calc(var(--vRythm) * 6);
            background-position: var(--gutter) bottom;
            background-size: calc(var(--vRythm) * 5) auto;
          }
          span.description {
            text-align: right;
            padding: 0 0 0
              calc(calc(var(--gutter) * 1) + calc(var(--column) * 1));
            font-size: var(--mediumFontSize);
            line-height: var(--mediumLineHeight);
          }
        }
        @media screen and (min-width: ${CSS_BREAKPOINT_START_M}) and (max-width: ${CSS_BREAKPOINT_END_M}) {
          a {
            width: calc(calc(var(--block) * 2) + calc(var(--gutter) * 3));
            height: calc(var(--vRythm) * 6);
            background-position: var(--gutter) bottom;
            background-size: calc(var(--vRythm) * 6) auto;
          }
          span.description {
            text-align: right;
            padding: 0 0 0
              calc(calc(var(--gutter) * 1) + calc(var(--column) * 2));
          }
        }
        @media screen and (min-width: ${CSS_BREAKPOINT_START_L}) and (max-width: ${CSS_BREAKPOINT_END_L}) {
          a {
            width: calc(calc(var(--block) * 3) + calc(var(--gutter) * 4));
          }
        }
        @media screen and (min-width: ${CSS_BREAKPOINT_START_XL}) {
          a {
            width: calc(calc(var(--block) * 4) + calc(var(--gutter) * 5));
          }
        }
        @media print {
          header {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
