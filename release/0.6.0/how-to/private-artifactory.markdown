---
title: Create Your Own Library of Constructs
layout: how-to
tags: how-to
order: 3
category: Advanced
---

## Private Library of DDK constructs

While the DDK holds a rich library of constructs, including numerous [data stages](https://awslabs.github.io/aws-ddk/release/latest/api/core/aws_ddk_core.html#data-stages), they do not satisfy every use case. As a result, customers might need to develop their own.

For instance, an organisation might have specific requirements in terms of security and compliance for their S3 buckets (e.g. a default lifecycle policy or encryption type). Likewise, they might wish to create reusable data stages that are not available in DDK today (e.g. a data stage that checks for PII). Furthermore, once they define these custom constructs, they would like to share them with others in their organisation in order to standardise best practice patterns, enforce compliance and security, or define default configuration. This follows the [define once, reuse always governance rule](https://aws.amazon.com/blogs/enterprise-strategy/governance-in-the-cloud-and-in-the-digital-age-part-one/).

In DDK, this can be achieved through a private code artifactory. The idea is to define your custom DDK constructs in a Python library hosted in an [AWS CodeArtifact](https://aws.amazon.com/codeartifact/) repository. Once available in the private code artifactory, it can be reused by other users in the organisation in their own applications.

To implement this pattern, follow this [example](https://github.com/aws-samples/aws-ddk-examples/tree/main/private_artifactory).