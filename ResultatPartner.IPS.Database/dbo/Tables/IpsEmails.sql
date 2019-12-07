CREATE TABLE [dbo].[IpsEmails] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Subject]     NVARCHAR (500) NOT NULL,
    [Message]     NVARCHAR (MAX) NOT NULL,
    [ToAddress]   NVARCHAR (500) NOT NULL,
    [CCAddress]   NVARCHAR (500) NULL,
    [SentTime]    DATETIME       NOT NULL,
    [FromAddress] NVARCHAR (500) NOT NULL,
    [FromUserId]  INT            NULL,
    [ToUserId]    INT            NULL,
    [BCCAddress]  NVARCHAR (500) NULL,
    [IsRead]      BIT            CONSTRAINT [DF_IpsEmails_IsRead] DEFAULT ((0)) NOT NULL,
    [ReadAt]      DATETIME       NULL,
    CONSTRAINT [PK_IpsEmails] PRIMARY KEY CLUSTERED ([Id] ASC)
);



