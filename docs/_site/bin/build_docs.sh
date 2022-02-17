#!/bin/bash

# setup working directory
docs_source_directory="./source"
release_version="${1}"
pushd $docs_source_directory

# build documentation
sphinx-apidoc -f -o ./cli ../../cli/aws_ddk
sphinx-apidoc -f -o ./core ../../core/aws_ddk_core
sphinx-build -b html -D release=${release_version} . ../release/next/api

# setup new release
cp -R ../release/next/ ../release/${release_version}
echo -e "\n- name: ${release_version}\n  root: ${release_version}" >> ../_data/versions.yaml
popd