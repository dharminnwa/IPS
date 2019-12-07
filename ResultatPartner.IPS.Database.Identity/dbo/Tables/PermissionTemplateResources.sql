CREATE TABLE [dbo].[PermissionTemplateResources] (
    [Id]                   INT IDENTITY (1, 1) NOT NULL,
    [ResourceId]           INT NOT NULL,
    [OperationId]          INT NOT NULL,
    [PermissionTemplateId] INT NOT NULL,
    CONSTRAINT [PK_PermissionTemplateResources] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PermissionTemplateResources_PermissionTemplates] FOREIGN KEY ([PermissionTemplateId]) REFERENCES [dbo].[PermissionTemplates] ([Id])
);



