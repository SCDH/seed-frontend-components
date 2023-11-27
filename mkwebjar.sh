#!/bin/sh

mkdir -p META-INF/resources
cp dist/* META-INF/resources

if [ -n "$CI_COMMIT_TAG" ]; then
    REVISION=$CI_COMMIT_TAG
else
    REVISION=$(npm pkg get version | tr -d \")
fi

WEBJAR=seed-frontend-components-webjar-$REVISION.jar

cat >  META-INF/MANIFEST.MF <<EOF
Manifest-Version: 1.0
Created-By: $0
Build-Jdk-Spec: 8
Specification-Title: SEED Frontend Components
Specification-Version: $REVISION
Specification-Vendor: SCDH
Implementation-Title: SEED Fontend Components
Implementation-Version: $REVISION
Implementation-Vendor: SCDH, ULB Münster
XWiki-Extension-Id: de.wwu.scdh.seed.seed-frontend-components
EOF

mkdir -p target

zip -r target/$WEBJAR META-INF
