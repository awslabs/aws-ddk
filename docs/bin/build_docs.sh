#!/bin/bash

# setup working directory
docs_source_directory="./source"
release_version="${1}"
pushd $docs_source_directory

# build documentation
sphinx-build -b html -D release=${release_version} . ../release/next/api

# setup new release
cp -R ../release/next/ ../release/${release_version}
if [ "$name" != "latest" ]
then
    echo -e "\n- name: ${release_version}\n  root: ${release_version}" >> ../_data/versions.yaml
fi
popd
