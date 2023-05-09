---
title: Understanding the AWS DataOps Development Kit (AWS DDK)
layout: how-to
tags: how-to
order: 1
category: Introduction
---

## What is the AWS DataOps Development Kit?

The AWS DataOps Development Kit (AWS DDK) is an open source development framework to help you build data workflows and modern data architecture on AWS.  

Based on the [AWS CDK](https://github.com/aws/aws-cdk),  it offers high-level abstractions allowing you to build pipelines that manage data flows on AWS, driven by DevOps best practices.  The framework is extensible, you can add abstractions for your own data processing infrastructure or replace our best practices with your own standards.  It's easy to share templates, so everyone in your organisation can concentrate on the business logic of dealing with their data, rather than boilerplate logic.

## Why did you build the AWS DDK?

To make DataOps on AWS easy!  We want customers to focus on writing code that adds business value, whether that is a data transformation, cleaning data to train a model, or creating a report.  We believe that orchestrating pipelines, creating infrastructure, and creating the DevOps behind that infrastructure is undifferentiated heavy lifting and should be done as easily as possible using a robust framework.

## What are the Advantages of using the AWS DDK in CDK Applications?

When building DataOps projects on AWS, there are three main advantages of using the AWS DDK.  First, it allows you to think at a higher level than infrastructure.  For example, you may need to build a pipeline to process a JSON file by removing some attributes and joining to another file.  With CDK , you'd need to think about creating an S3 bucket to land the input file, creating an AWS Lambda function for the simple transformation, creating an AWS Glue job to join the files, and creating the wiring to orchestrate the process.  With AWS DDK you can simply create a pipeline, dropping in the stages you need to process your data.  You can focus creating the transformation and join logic, rather than the infrastructure.

Second, you can capture DataOps best practice.  By default, the library uses  our opinion of good practice on AWS.  For example, when you create an S3 bucket, it will always block public access and enforce encryption.  If you want to add our recommended, AWS-native DevOps to your pipeline, it's as easy as adding a single line of code.  However, we appreciate that our best practice might not be yours and the tools you use may be different.  To help you, we've made it easy to swap out our implementations for your own.  If you think the way you do DataOps is something that other organisations could use, we encourage you to raise a pull request to share it with our community.

Third, we've made it easy for you to share your version of DataOps with the rest of your organisation.  These days, almost every technical team needs to handle data, but won't necessarily have a deep understanding of DataOps or AWS Infrastructure.  The AWS DDK allows you to give these teams the tools they need to manage their data with the knowledge that when they deploy AWS infrastructure, it will follow your best practice.


