CREATE TABLE [dbo].[HelpCategory] (
    [HelpCategoryID]   INT            IDENTITY (1, 1) NOT NULL,
    [Title]            VARCHAR (1000) NULL,
    [Meta]             VARCHAR (1000) NULL,
    [KeyWord]          VARCHAR (1000) NULL,
    [Description]      VARCHAR (2000) NULL,
    [LanguageID]       INT            CONSTRAINT [DF_HelpCategory_LanguageID] DEFAULT ((1)) NULL,
    [IsParentCategory] BIT            CONSTRAINT [DF_HelpCategory_IsParentCategory] DEFAULT ((0)) NULL,
    [ParentCategoryID] INT            NULL,
    [IsDeleted]        BIT            CONSTRAINT [DF_HelpCategory_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_HelpCategory] PRIMARY KEY CLUSTERED ([HelpCategoryID] ASC)
);



