from typing import Any, Dict, List, Optional

from aws_cdk.aws_s3 import Bucket, IBucket
from aws_ddk_core.pipelines import DataStage
from aws_ddk_core.resources import S3Factory
from constructs import Construct


class DummyStage(DataStage):
    """
    Class that represents an S3 Event DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        **kwargs: Any,
    ) -> None:
        """
        DDK Dummy stage.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        """
        super().__init__(scope, id, **kwargs)

        self._event_source: str = f"{id}-event-source"
        self._event_detail_type: str = f"{id}-event-type"

        self._bucket = S3Factory.bucket(
            self,
            "ddk-bucket",
            environment_id=environment_id,
        )


    @property
    def bucket(self) -> IBucket:
        """
        Return: IBucket
            S3 bucket
        """
        return self._bucket

    def get_event_pattern(self) -> Optional[EventPattern]:
        return EventPattern(
            source=[self._event_source],
            detail_type=[self._event_detail_type],
        )

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return None
