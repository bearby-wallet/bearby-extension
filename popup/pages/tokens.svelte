<script lang="ts">
  import { _ } from "popup/i18n";

  import NavClose from "../components/NavClose.svelte";
  import SearchBox from "../components/SearchBox.svelte";
  import AddIcon from "../components/icons/Add.svelte";
  import Modal from "../components/Modal.svelte";
  import AddTokenModal from "../modals/AddToken.svelte";

  let search = "";
  let tokenAddModal = false;
  let tokensList = [];

  const onInputSearch = (e: CustomEvent) => {
    search = e.detail;
  };
</script>

<Modal
  show={Boolean(tokenAddModal)}
  title={$_("tokens.modals.add.title")}
  on:close={() => (tokenAddModal = !tokenAddModal)}
>
  <div class="m-warp">
    <AddTokenModal on:close={() => (tokenAddModal = !tokenAddModal)} />
  </div>
</Modal>

<main>
  <NavClose title={$_("tokens.title")} />
  <div>
    <SearchBox
      placeholder={$_("tokens.placeholder")}
      focus
      on:input={onInputSearch}
    >
      <span class="add" on:mouseup={() => (tokenAddModal = !tokenAddModal)}>
        <AddIcon />
      </span>
    </SearchBox>
    <ul>
      {#if tokensList.length == 0}
        <p>
          {$_("tokens.notokens")}
        </p>
      {/if}
    </ul>
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
