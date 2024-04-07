<script lang="ts">
  export let src: string;
  export let alt: string;
  export let width: string | number = 30;
  export let height: string | number = 30;

  const hanldeLoadError = () => {
    src = "/icons/unknown.svg";
  };
</script>

<img {src} {alt} {width} {height} loading="lazy" on:error={hanldeLoadError} />
