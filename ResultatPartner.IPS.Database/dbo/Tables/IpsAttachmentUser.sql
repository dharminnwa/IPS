CREATE TABLE [dbo].[IpsAttachmentUser] (
    [Id]              INT      IDENTITY (1, 1) NOT NULL,
    [IpsAttachemntId] INT      NOT NULL,
    [UserId]          INT      NOT NULL,
    [CreatedOn]       DATETIME NULL,
    [CreatedBy]       INT      NULL,
    CONSTRAINT [PK_IpsAttachmentUser] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_IpsAttachmentUser_IpsAttachments] FOREIGN KEY ([IpsAttachemntId]) REFERENCES [dbo].[IpsAttachments] ([Id]),
    CONSTRAINT [FK_IpsAttachmentUser_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

