CREATE TABLE [dbo].[HelpContent] (
    [HelpContentID]  INT            IDENTITY (1, 1) NOT NULL,
    [Title]          VARCHAR (1000) NULL,
    [HelpCategoryID] INT            NULL,
    [Description]    VARCHAR (MAX)  NULL,
    [LanguageID]     INT            CONSTRAINT [DF_HelpContent_LanguageID] DEFAULT ((1)) NULL,
    [IsDeleted]      BIT            CONSTRAINT [DF_HelpContent_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_HelpContent] PRIMARY KEY CLUSTERED ([HelpContentID] ASC),
    CONSTRAINT [FK_HelpContent_HelpCategory] FOREIGN KEY ([HelpCategoryID]) REFERENCES [dbo].[HelpCategory] ([HelpCategoryID])
);



