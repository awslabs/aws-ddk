# AWS DataOps Development Kit (DDK) Documentation

## Contributing a How-To Guide

- All new How-To guides should be created in the `release/next/how-to` directory.
- The guide should include the following front matter at the top of the file, you will need to update the title and possibly the category:

```
title: <Title to be displayed to customers>
layout: default
tags: how-to
order: 1
category: Advanced
```
- The allowed values for `category` are held in `_data\how-to-categories.yaml`.  If you think your how-to guide doesn't fit into one of the existing categories, then add a new entry to this file.
- In `_data\how-to-categories.yaml`, 'name' is displayed as the group header on the How-To indexes and `category` matches to the category in the how-to guide.  The `order` variable determines the order of the how-to guide within the category.
- After the front matter, add your how-to guide to the file

# How to Release

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
