CREATE TABLE [dbo].[IPSEMailAttachments] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [FileName]   NVARCHAR (100) NOT NULL,
    [IPSEmailId] INT            NOT NULL,
    CONSTRAINT [PK_IPSEMailAttachments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_IPSEMailAttachments_IpsEmails] FOREIGN KEY ([IPSEmailId]) REFERENCES [dbo].[IpsEmails] ([Id])
);

