#!/bin/sh

if [ -n "$CI_COMMIT_TAG" ]; then
    REVISION=$CI_COMMIT_TAG
else
    REVISION=$(npm pkg get version | tr -d \")
fi

MVN_GROUP=de.wwu.scdh.seed
MVN_ARTIFACT=seed-frontend-components-webjar

# internal directory structure of the web jar
INTERNAL_DIR=META-INF/resources/webjars/$MVN_ARTIFACT/$REVISION

mkdir -p $INTERNAL_DIR
cp dist/* $INTERNAL_DIR



WEBJAR=$MVN_ARTIFACT-$REVISION.jar
POM=$MVN_ARTIFACT-$REVISION.pom

REPO_URL=https://zivgitlab.uni-muenster.de/SCDH/tei-processing/seed-frontend-components


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
XWiki-Extension-Id: $MVN_GROUP.$MVN_ARTIFACT
EOF

mkdir -p target

zip -r target/$WEBJAR META-INF


cat > target/$POM <<EOF
<project
    xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>$MVN_GROUP</groupId>
  <artifactId>$MVN_ARTIFACT</artifactId>
  <version>$REVISION</version>
  <name>SEED Frontend Components</name>
  <url>$REPO_URL</url>
  <licenses>
    <license>
      <name>MIT</name>
      <url>https://opensource.org/licenses/mit-license.php</url>
    </license>
  </licenses>
  <scm>
    <connection>scm:git:$REPO_URL.git</connection>
    <developerConnection>scm:git:$REPO_URL.git</developerConnection>
    <url>scm:git:$REPO_URL.git</url>
    <tag>HEAD</tag>
  </scm>
</project>
EOF
