CREATE TABLE [dbo].[ProjectRoles] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Name]        NVARCHAR (MAX) NOT NULL,
    [Description] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_ProjectRoles] PRIMARY KEY CLUSTERED ([Id] ASC)
);



