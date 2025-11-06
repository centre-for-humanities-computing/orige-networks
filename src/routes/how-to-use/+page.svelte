<script>
    import markdownit from 'markdown-it';
    import usePage from "$lib/assets/how-to-use.md?raw"

    const md = markdownit();
    const result = md.render(usePage);
</script>

{@html result}