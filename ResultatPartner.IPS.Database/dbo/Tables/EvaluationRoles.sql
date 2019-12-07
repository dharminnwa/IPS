CREATE TABLE [dbo].[EvaluationRoles] (
    [Id]   INT           IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (50) NULL,
    CONSTRAINT [PK_EvaluationRoles] PRIMARY KEY CLUSTERED ([Id] ASC)
);

