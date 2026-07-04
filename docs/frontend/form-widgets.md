---
title: 表单组件
---

# 表单组件

## ImageUpload

图片上传组件，支持预览、拖拽、文件类型限制。

```tsx
import ImageUpload from '@/modules/admin/components/form/ImageUpload'

<ImageUpload value={url} onChange={setUrl} accept={['image/jpeg', 'image/png']} maxSize={10} />
```

## FileUpload

文件上传组件。

```tsx
import FileUpload from '@/modules/admin/components/form/FileUpload'

<FileUpload value={files} onChange={setFiles} accept={['application/pdf']} maxSize={50} />
```

## TagInput

标签输入组件，支持自由输入和回车添加。

```tsx
import TagInput from '@/modules/admin/components/form/TagInput'

<TagInput value={tags} onChange={setTags} placeholder="输入后回车添加" />
```
