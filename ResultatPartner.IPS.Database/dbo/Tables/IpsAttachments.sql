CREATE TABLE [dbo].[IpsAttachments] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Title]       NVARCHAR (50)  NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    [CreatedOn]   DATETIME       NOT NULL,
    [CreatedBy]   INT            NOT NULL,
    CONSTRAINT [PK_IpsAttachments] PRIMARY KEY CLUSTERED ([Id] ASC)
);

