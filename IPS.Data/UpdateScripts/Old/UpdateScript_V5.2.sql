BEGIN TRANSACTION
GO
ALTER TABLE dbo.EvaluationStatuses ADD
	IsOpen bit NOT NULL CONSTRAINT DF_EvaluationStatuses_IsOpen DEFAULT 0
GO
COMMIT