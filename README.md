# Tribunator

Analyzing politicals writtings.

## Setup

Install NodeJS and clone the project.

First in a different folder do this:
```sh
git clone git@github.com:Linguistic/corenlp.git
cd corenlp
docker build --build-arg 'LANGUAGE=french' --build-arg 'CORENLP_VERSION=4.5.2' -t 'corenlp/french' .
docker run -p 9000:9000 corenlp/french
```

Ensure you installed `inkscape` and `chromium`.

Then, run the data ingestion:
```sh
## Generate tribunes from raw sources
npm run tribunes
## Or only the one you want
npm run tribunes -- 2023-07-douai-notre-ville.md
## Generate profiles banners
npm run profiles
## Compute writting stats
npm run stats
## Compute presence stats
npm run presences
```

And finally run the app:
```sh
npm run dev
```

## Known issues

Lemmatization is not working properly. May be useful to [see this](http://www.erwanlenagard.com/general/tutoriel-implementer-stanford-corenlp-avec-talend-1354).

## Windows & MAC users

Lol.
