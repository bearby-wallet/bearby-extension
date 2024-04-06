<script lang="ts">
  import { _ } from "popup/i18n";

  import NavClose from "../components/NavClose.svelte";
  import SearchBox from "../components/SearchBox.svelte";
  import AddIcon from "../components/icons/Add.svelte";

  let search = "";
  let tokenAddModal = false;

  const onInputSearch = (e: CustomEvent) => {
    search = e.detail;
  };
</script>

<main>
  <NavClose title={$_("tokens.title")} />
  <div>
    <SearchBox
      placeholder={$_("accounts.placeholder")}
      focus
      on:input={onInputSearch}
    >
      <span class="add" on:mouseup={() => (tokenAddModal = !tokenAddModal)}>
        <AddIcon />
      </span>
    </SearchBox>
  </div>
</main>

<style lang="scss">
  @import "../styles/mixins";
  main {
    height: 100vh;
    overflow: hidden;

    @include flex-center-top-column;

    :global(ul) {
      max-width: 500px;
    }
  }
  span.add {
    cursor: pointer;
    margin: 5px;

    &:hover {
      :global(svg > line) {
        stroke: var(--card-color);
      }
      :global(svg > rect) {
        fill: var(--primary-color);
      }
    }
  }
</style>
