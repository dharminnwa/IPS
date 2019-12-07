CREATE TABLE [dbo].[ResourceDepedencyPermissions] (
    [Id]                  INT IDENTITY (1, 1) NOT NULL,
    [ResourceId]          INT NOT NULL,
    [DependentResourceId] INT NOT NULL,
    [OperationId]         INT NOT NULL,
    CONSTRAINT [PK_ResourceDepedencyPermissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);

