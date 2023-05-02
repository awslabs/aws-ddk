#!/bin/bash

release_version="${1}"

# setup new release
cp -R release/next/ release/${release_version}
if grep -Fq "$release_version" _data/versions.yaml
then
    echo "version: ${release_version} already exists in versions.yaml"
else
    echo "version: ${release_version} does not exist in versions.yaml and will be added"
    echo -e "\n- name: ${release_version}\n  root: ${release_version}" >> _data/versions.yaml
fi