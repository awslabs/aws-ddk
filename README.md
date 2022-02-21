# AWS DataOps Development Kit (DDK) Documentation

## Contributing a How-To Guide

- All new How-To guides should be created in the `release/next/how-to` directory.
- The guide should include the following front matter at the top of the file, you will need to update the title and possibly the category:

```
title: <Title to be displayed to customers>
layout: default
tags: how-to
category: Advanced
```
- The allowed values for `category` are held in `_data\how-to-categories.yaml`.  If you think your how-to guide doesn't fit into one of the existing categories, then add a new entry to this file.
- In `_data\how-to-categories.yaml`, 'name' is displayed as the group header on the How-To indexes and `category` matches to the category in the how-to guide.
- After the front matter, add your how-to guide to the file

# How to Release
## 1) Build the API Documentation
- The API documentation is generated from the code base using sphinx-build.
- Set ${root} to be the root of the main branch of the ddk
- Set ${releaseVersion} to be the version of the next release

```shell
cd ./docs/source
pip install -r requirements.txt
sphinx-apidoc -f -o ./cli ${root}/cli/aws_ddk
sphinx-apidoc -f -o ./core ${root}/core/aws_ddk_core
sphinx-build -b html -D release=${releaseVersion} . ../release/next/api
```

## 2) Copy the directory
- Snapshot the `next` directory by creating a copy to a new directory under `release`

```shell
cp -R ./release/next/ ./release/${releaseVersion}
```

## 3) Update the config file

- Edit `_data\versions.yaml` adding a new entry to the end of the array.

```yaml
- name: # the name of the release - should be the same as ${releaseVersion}
  root: ${releaseVersion}
```

## Testing Locally with Jekyll
- jekyll install: https://jekyllrb.com/docs/installation/
```
cd docs
bundle install 
bundle exec jekyll serve
```

## Automated Release
The documentation release process can be automated by using `./bin/build_docs.sh`
