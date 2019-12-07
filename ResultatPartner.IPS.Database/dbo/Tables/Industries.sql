CREATE TABLE [dbo].[Industries] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (350) NOT NULL,
    [Description]    NVARCHAR (450) NULL,
    [ParentId]       INT            NULL,
    [OrganizationId] INT            NULL,
    CONSTRAINT [PK_Industries] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Industries_Industries] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Industries] ([Id])
);




GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_Industries_Name]
    ON [dbo].[Industries]([Name] ASC);

