CREATE TABLE [dbo].[UserTypes] (
    [Id]       INT           IDENTITY (1, 1) NOT NULL,
    [UserType] NVARCHAR (50) NULL,
    CONSTRAINT [PK_UserTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
);

