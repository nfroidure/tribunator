import { FACEBOOK_ACCOUNT, TWITTER_ACCOUNT } from "../utils/constants";
import { publicRuntimeConfig } from "../utils/config";

export default function Social(): JSX.Element {
  return (
    <nav>
      <ul>
        <li className="twitter">
          <a
            href={`https://twitter.com/${TWITTER_ACCOUNT}`}
            title="Me suivre sur Twitter"
            target="_blank"
          >
            <span>Twitter</span>
          </a>
        </li>
        <li className="facebook">
          <a
            href={`https://facebook.com/${FACEBOOK_ACCOUNT}`}
            title="Me suivre sur Facebook"
            target="_blank"
          >
            <span>Facebook</span>
          </a>
        </li>
        <li className="feed">
          <a
            href="/tribunes.atom"
            title="S'abonner aux mises à jour"
            target="_blank"
          >
            <span>Flux de syndication</span>
          </a>
        </li>
      </ul>
      <style jsx>{`
        nav {
          padding: 0 0 0 var(--gutter);
          margin: 0;
        }
        ul {
          display: flex;
          justify-content: center;
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        li {
          display: block;
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        a {
          display: block;
          width: var(--vRythm);
          height: var(--vRythm);
          background: var(--light);
          mask-repeat: no-repeat;
          mask-position: center bottom;
          mask-size: calc(var(--vRythm) * 1);
          -webkit-mask-size: calc(var(--vRythm) * 1);
          mask-image: url("${publicRuntimeConfig.buildPrefix}/images/icons/twitter.svg");
        }
        li.facebook a {
          mask-image: url("${publicRuntimeConfig.buildPrefix}/images/icons/facebook.svg");
        }
        li.feed a {
          mask-image: url("${publicRuntimeConfig.buildPrefix}/images/icons/feed.svg");
        }
        span {
          display: none;
        }
      `}</style>
    </nav>
  );
}
