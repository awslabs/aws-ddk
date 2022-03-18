from typing import Any

from aws_cdk.aws_codeartifact import CfnDomain, CfnRepository
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import S3Factory
from constructs import Construct


class ArtifactoryStack(BaseStack):
    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        domain_name: str,
        domain_owner: str,
        repository_name: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(scope, id, environment_id, **kwargs)

        domain = CfnDomain(
            self,
            id="ArtifactoryDomain",
            domain_name=domain_name,
        )
        repository = CfnRepository(
            self,
            id="ArtifactoryRepository",
            domain_name=domain_name,
            repository_name=repository_name,
            domain_owner=domain_owner,
            external_connections=["public:pypi"],
        )
        repository.add_depends_on(domain)
