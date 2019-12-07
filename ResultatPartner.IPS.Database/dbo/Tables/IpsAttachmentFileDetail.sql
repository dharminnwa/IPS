CREATE TABLE [dbo].[IpsAttachmentFileDetail] (
    [Id]              INT           IDENTITY (1, 1) NOT NULL,
    [IpsAttachmentId] INT           NOT NULL,
    [FileName]        NVARCHAR (50) NULL,
    CONSTRAINT [PK_IpsAttachmentFileDetail] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_IpsAttachmentFileDetail_IpsAttachments] FOREIGN KEY ([IpsAttachmentId]) REFERENCES [dbo].[IpsAttachments] ([Id])
);

