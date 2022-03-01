#!/bin/bash

# setup working directory
docs_source_directory="./source"
release_version="${1}"
pushd $docs_source_directory

# build documentation
sphinx-build -b html -D release=${release_version} . ../release/next/api

# setup new release
cp -R ../release/next/ ../release/${release_version}
if grep -Fq "$release_version" ../_data/versions.yaml
then
    echo "version: ${release_version} already exists in versions.yaml"
else
    echo "version: ${release_version} does not exist in versions.yaml and will be added"
    echo -e "\n- name: ${release_version}\n  root: ${release_version}" >> ../_data/versions.yaml
fi
popd
