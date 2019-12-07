CREATE TABLE [dbo].[Documents] (
    [Id]           UNIQUEIDENTIFIER NOT NULL,
    [Title]        NVARCHAR (250) NULL,
    [Extension]    NVARCHAR (10)  NOT NULL,
    [ResourceType] NVARCHAR (255) NOT NULL,
    CONSTRAINT [PK_Documents] PRIMARY KEY CLUSTERED ([Id] ASC)
);
